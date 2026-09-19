import { NextRequest, NextResponse } from 'next/server';

/**
 * Exchanges a Google-verified email for a signed dashboard token.
 *
 * Each dashboard backend mints and verifies its own tokens, so the login app
 * never shares a JWT secret between services — it only holds the SSO secret
 * that authorises it to *ask* for a token.
 *
 *   Faculty → SGS_BACKEND_URL + /api/v1/auth/sso-token   (existing)
 *   Parent  → SGS_PARENT_SSO_URL                          (full URL)
 *
 * If a role's endpoint is not configured, respond with no token rather than
 * an error: the dashboard page then redirects without one, which is exactly
 * what happened before this route knew about that role.
 */

type SsoTarget = { url: string } | null;

function resolveTarget(role: string | undefined): SsoTarget {
  switch (role) {
    case 'Parent': {
      const url = process.env.SGS_PARENT_SSO_URL;
      return url ? { url } : null;
    }
    // Faculty, and any caller predating the `role` field.
    default: {
      const base = process.env.SGS_BACKEND_URL;
      return base ? { url: `${base.replace(/\/$/, '')}/api/v1/auth/sso-token` } : null;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const target = resolveTarget(role);

    if (!target) {
      // Faculty has always failed loudly here; keep that. For newer roles a
      // missing endpoint is a deployment that hasn't opted in yet, not an error.
      if (role === undefined || role === 'Faculty') {
        return NextResponse.json({ error: 'SGS_BACKEND_URL is not configured' }, { status: 500 });
      }
      return NextResponse.json({ access_token: null });
    }

    const res = await fetch(target.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SSO-Secret': process.env.SGS_SSO_SECRET || '',
      },
      body: JSON.stringify({ email, role }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'SSO failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ access_token: data.access_token });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
