import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const backendUrl = process.env.SGS_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json({ error: 'SGS_BACKEND_URL is not configured' }, { status: 500 });
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/auth/sso-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SSO-Secret': process.env.SGS_SSO_SECRET || '',
      },
      body: JSON.stringify({ email }),
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
