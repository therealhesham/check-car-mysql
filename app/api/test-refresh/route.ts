import { NextRequest, NextResponse } from 'next/server';
import { jwtService } from '@/utils/jwt';
import { Token } from '@/utils/Token';

export async function GET(request: NextRequest) {
  try {
    // الحصول على refreshToken من الكوكيز
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 400 });
    }
    
    console.log('Test API: Starting refresh token test...');
    
    // Step 1: Verify token
    console.log('Test API: Verifying refresh token...');
    const decoded = await jwtService.verifyToken(refreshToken);
    console.log('Test API: Refresh token verified successfully.');
    
    // Step 2: Check database
    console.log('Test API: Checking token in database...');
    const dbToken = await Token.findRefreshToken(refreshToken);
    
    if (!dbToken || !dbToken.is_active || !dbToken.users) {
      console.log('Test API: Token invalid in DB.');
      return NextResponse.json({ error: 'Token invalid in DB' }, { status: 401 });
    }
    
    console.log('Test API: Token is valid in database.');
    
    // Step 3: Generate new access token
    console.log('Test API: Generating new access token...');
    const newPayload = {
      userId: dbToken.users.id,
      EmID: dbToken.users.EmID,
      role: dbToken.users.role,
      branchIds: [], // قد تحتاج إلى ملء هذه القيمة بشكل صحيح
    };
    
    const newAccessToken = await jwtService.generateAccessToken(newPayload);
    console.log('Test API: New access token generated.');
    
    // إنشاء استجابة وتعيين الكوكي الجديد
    const response = NextResponse.json({ 
      success: true, 
      message: 'Token refreshed',
      userId: dbToken.users.id,
      tokenExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
    
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 دقيقة
    });
    
    return response;
  } catch (error) {
    console.error('Test API: Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}