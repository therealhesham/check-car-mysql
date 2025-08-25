import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { Token } from '@/utils/Token';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 400 });
    }
    
    // التحقق من صلاحية التوكن
    try {
      await jwtVerify(refreshToken, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
    
    // التحقق من التوكن في قاعدة البيانات
    const dbToken = await Token.findRefreshToken(refreshToken);
    
    if (!dbToken || !dbToken.is_active || !dbToken.users) {
      return NextResponse.json({ error: 'Token invalid in DB' }, { status: 401 });
    }
    
    // إرجاع بيانات المستخدم
    return NextResponse.json({
      success: true,
      user: {
        id: dbToken.users.id,
        EmID: dbToken.users.EmID,
        role: dbToken.users.role,
      }
    });
    
  } catch (error) {
    console.error('Verify refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}