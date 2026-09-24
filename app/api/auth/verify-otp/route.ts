// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ valid: false, message: 'Phone and OTP are required' }, { status: 400 });
    }

    const result = await withClient(async (client) => {
      // Check if OTP matches and is not expired
      return await client.query(`
        SELECT * FROM otp_verifications
        WHERE phone = $1 AND otp = $2 AND expires_at > NOW()
      `, [phone.trim(), otp]); // Added 'otp' here
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      }, { status: 400 });
    }

    // Delete the OTP so it cannot be reused
    await withClient(async (client) => {
      await client.query(`DELETE FROM otp_verifications WHERE phone = $1`, [phone.trim()]);
    });

    return NextResponse.json({ valid: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ valid: false, message: 'Server error during verification' }, { status: 500 });
  }
}