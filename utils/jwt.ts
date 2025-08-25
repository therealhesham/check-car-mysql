

// // export default new JWTService();
// // export type { JWTPayload, DecodedToken };

// import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';

// // تأكد من أن هذا المتغير مطابق للموجود في الـ middleware
// const JWT_SECRET = new TextEncoder().encode(
//   process.env.JWT_SECRET || 'your-secret-key'
// );

// const ACCESS_TOKEN_EXPIRES: string = process.env.JWT_ACCESS_EXPIRES || '15m';

// // ✨ حمولة التوكن المعدلة (Payload)
// // نقوم بتوسيع الواجهة الأساسية من jose لإضافة حقولنا الخاصة
// interface CustomJWTPayload extends JoseJWTPayload {
//     userId: number;
//     email?: string;
//     role: string;
//     EmID: number;
//     // 💡 أفضل ممارسة: استخدم معرفات (IDs) بدلاً من نصوص مباشرة
//     branchIds: number[]; 
// }

// class JWTService {
//     /**
//      * @description إنشاء access token باستخدام مكتبة jose.
//      * @param payload - البيانات التي سيتم تضمينها في التوكن (userId, role, etc.).
//      * @returns {Promise<string>} - التوكن الموقّع.
//      */
//     async generateAccessToken(payload: Omit<CustomJWTPayload, 'iat' | 'exp'>): Promise<string> {
//         return await new SignJWT(payload)
//             .setProtectedHeader({ alg: 'HS256' })
//             .setIssuedAt()
//             .setExpirationTime(ACCESS_TOKEN_EXPIRES)
//             .sign(JWT_SECRET);
//     }

//     /**
//      * @description التحقق من صحة التوكن باستخدام مكتبة jose.
//      * @param token - التوكن للتحقق منه.
//      * @returns {Promise<CustomJWTPayload>} - الحمولة (payload) إذا كان التوكن صالحًا.
//      */
//     async verifyToken(token: string): Promise<CustomJWTPayload> {
//         try {
//             const { payload } = await jwtVerify<CustomJWTPayload>(token, JWT_SECRET);
//             return payload;
//         } catch (error) {
//             // يمكنك تسجيل تفاصيل الخطأ هنا إذا كنت في وضع التطوير
//             // console.error('Token verification failed:', error);
//             throw new Error('Invalid or expired token');
//         }
//     }
    
//     /**
//      * @description استخراج بيانات المستخدم من التوكن بعد التحقق منه.
//      * @param token - التوكن المطلوب فك تشفيره.
//      * @returns {Promise<Partial<CustomJWTPayload> | null>} - كائن يحتوي على بيانات المستخدم أو null في حالة الفشل.
//      */
//     async getUserFromToken(token: string): Promise<Partial<CustomJWTPayload> | null> {
//         try {
//             const decoded = await this.verifyToken(token);
//             return {
//                 userId: decoded.userId,
//                 email: decoded.email,
//                 role: decoded.role,
//                 EmID: decoded.EmID,
//                 branchIds: decoded.branchIds // ✨ استرجاع المعرفات
//             };
//         } catch (error) {
//             return null;
//         }
//     }
    
//     /**
//      * @description إنشاء refresh token عشوائي وآمن.
//      * @returns {string} - سلسلة نصية فريدة للـ refresh token.
//      */
//     generateRefreshToken(): string {
//         if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
//             const array = new Uint8Array(40);
//             crypto.getRandomValues(array);
//             return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
//         }
//         // احتياطي للبيئات التي لا تدعم Web Crypto API
//         return Math.random().toString(36).substring(2) + Date.now().toString(36);
//     }
// }

// // تصدير نسخة واحدة من الخدمة لاستخدامها في التطبيق
// export const jwtService = new JWTService();

import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';

// تأكد من أن هذا المتغير مطابق للموجود في الـ middleware وملف .env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// ✅ متغيرات جديدة لمدد الصلاحية
const ACCESS_TOKEN_EXPIRES: string = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRES: string = process.env.JWT_REFRESH_EXPIRES || '8h'; // 👈 تم التعديل هنا

interface CustomJWTPayload extends JoseJWTPayload {
  userId: number;
  email?: string;
  role: string;
  EmID: number;
  branchIds: number[];
}

class JWTService {
  /**
   * @description إنشاء access token باستخدام مكتبة jose.
   * @param payload - البيانات التي سيتم تضمينها في التوكن (userId, role, etc.).
   * @returns {Promise<string>} - التوكن الموقّع.
   */
  async generateAccessToken(payload: Omit<CustomJWTPayload, 'iat' | 'exp'>): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRES)
      .sign(JWT_SECRET);
  }

  /**
   * @description إنشاء refresh token موقّع بمدة صلاحية أطول.
   * @param payload - بيانات المستخدم (userId).
   * @returns {Promise<string>} - التوكن الموقّع.
   */
  async generateRefreshToken(payload: Pick<CustomJWTPayload, 'userId'>): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRES)
      .sign(JWT_SECRET);
  }

  /**
   * @description التحقق من صحة التوكن باستخدام مكتبة jose.
   * @param token - التوكن للتحقق منه.
   * @returns {Promise<CustomJWTPayload>} - الحمولة (payload) إذا كان التوكن صالحًا.
   */
  async verifyToken(token: string): Promise<CustomJWTPayload> {
    try {
      const { payload } = await jwtVerify<CustomJWTPayload>(token, JWT_SECRET);
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * @description استخراج بيانات المستخدم من التوكن بعد التحقق منه.
   * @param token - التوكن المطلوب فك تشفيره.
   * @returns {Promise<Partial<CustomJWTPayload> | null>} - كائن يحتوي على بيانات المستخدم أو null في حالة الفشل.
   */
  async getUserFromToken(token: string): Promise<Partial<CustomJWTPayload> | null> {
    try {
      const decoded = await this.verifyToken(token);
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        EmID: decoded.EmID,
        branchIds: decoded.branchIds
      };
    } catch (error) {
      return null;
    }
  }
}

export const jwtService = new JWTService();