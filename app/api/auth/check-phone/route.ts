// app/api/auth/check-phone/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withClient } from '@/lib/db';
import { getRoleMapping, checkAccountStatus } from '@/lib/role-mapping';

// Normalize phone number
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

// Validate phone number
function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned) || /^[0-9]{10,15}$/.test(cleaned);
}

function phoneLookupValues(phone: string): string[] {
  const cleaned = normalizePhone(phone);
  if (!cleaned) return [];

  const values = [cleaned];
  
  // If it's a 10-digit number, try with +91 prefix
  if (cleaned.length === 10) {
    values.push(`+91${cleaned}`);
  }
  
  // If it starts with 91, try without
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    values.push(cleaned.slice(2));
  }

  return Array.from(new Set(values));
}

function isSafeIdentifier(identifier: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role } = body;

    if (!phone || !role) {
      return NextResponse.json(
        { valid: false, message: 'Phone number and role are required' },
        { status: 400 }
      );
    }

    const mapping = getRoleMapping(role);
    if (!mapping) {
      return NextResponse.json(
        { valid: false, message: 'Invalid role selected' },
        { status: 400 }
      );
    }

    const phoneValues = phoneLookupValues(phone);
    if (phoneValues.length === 0 || !isValidPhone(phone)) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const { table, phoneColumn } = mapping;
    if (!isSafeIdentifier(table) || !isSafeIdentifier(phoneColumn)) {
      return NextResponse.json(
        { valid: false, message: 'Phone login is not configured correctly.' },
        { status: 500 }
      );
    }

    const placeholders = phoneValues.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      SELECT *
      FROM ${table}
      WHERE REGEXP_REPLACE(COALESCE(${phoneColumn}::text, ''), '[^0-9+]', '', 'g') IN (${placeholders})
      LIMIT 1
    `;

    // Use withClient for automatic connection management
    const result = await withClient(async (client) => {
      return await client.query(query, phoneValues);
    });

    if (result.rows.length === 0) {
      return NextResponse.json({
        valid: false,
        message: `No ${role} found with this phone number. Please contact your administrator.`
      });
    }

    const user = result.rows[0];
    const statusCheck = checkAccountStatus(mapping, user);
    if (!statusCheck.allowed) {
      return NextResponse.json({
        valid: false,
        message: statusCheck.message
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'User validated successfully',
      user
    });
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Unable to validate phone number. Please try again.' },
      { status: 500 }
    );
  }
}
