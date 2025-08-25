// import jwt from 'jsonwebtoken';
// import { prisma } from '../lib/prisma';
// import { users, user_sessions, tokens, tokens_type } from '@prisma/client';
// import { Prisma } from '@prisma/client';

// interface TokenWithUser extends tokens {
//   users?: users;
// }

// interface SessionData {
//   userId: number;
//   refreshToken: string;
//   deviceInfo?: string;
//   ipAddress?: string;
// }

// export class Token {
//   static async generateAccessToken(userId: number): Promise<string> {
//     return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
//       expiresIn: '15m',
//     });
//   }

//   static async generateRefreshToken(userId: number): Promise<string> {
//     return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
//       expiresIn: '8h',
//     });
//   }

//   // ✅ الحل النهائي - استخدام UncheckedCreateInput مع الأسماء الفعلية
//   static async saveRefreshToken(userId: number, refreshToken: string): Promise<tokens> {
//     try {
//       // 💡 الخطوة الأولى: حذف جميع التوكنات السابقة لهذا المستخدم
//       await prisma.tokens.deleteMany({
//         where: {
//           user_id: userId,
//         },
//       });

//       // 💡 الخطوة الثانية: حفظ التوكن الجديد
//       const data: Prisma.tokensUncheckedCreateInput = {
//         user_id: userId,
//         token: refreshToken,
//         type: 'refresh',
//         expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000),
//         created_at: new Date(),
//         is_active: true,
//       };

//       return await prisma.tokens.create({ data });
//     } catch (error) {
//       console.error('Error saving refresh token:', error);
//       throw new Error('Failed to save refresh token');
//     }
//   }

//   static async removeRefreshToken(refreshToken: string): Promise<tokens | null> {
//     try {
//       // البحث أولاً ثم الحذف
//       const tokenToDelete = await prisma.tokens.findFirst({
//         where: { token: refreshToken },
//       });

//       if (tokenToDelete) {
//         return await prisma.tokens.delete({
//           where: { id: tokenToDelete.id },
//         });
//       }
//       return null;
//     } catch (error) {
//       console.error('Error removing refresh token:', error);
//       return null;
//     }
//   }

//   static async findRefreshToken(refreshToken: string): Promise<TokenWithUser | null> {
//     try {
//       const result = await prisma.tokens.findFirst({
//         where: { token: refreshToken },
//         include: { users: true },
//       });

//       return result;
//     } catch (error) {
//       console.error('Error finding refresh token:', error);
//       return null;
//     }
//   }

//   // ✅ استخدام UncheckedCreateInput للـ user_sessions أيضاً
//   static async storeUserSession(sessionData: SessionData): Promise<user_sessions> {
//     const data: Prisma.user_sessionsUncheckedCreateInput = {
//       user_id: sessionData.userId,        // ✅ اسم الحقل الفعلي
//       refresh_token: sessionData.refreshToken,  // ✅ اسم الحقل الفعلي
//       device_info: sessionData.deviceInfo,      // ✅ اسم الحقل الفعلي
//       ip_address: sessionData.ipAddress,        // ✅ اسم الحقل الفعلي
//       created_at: new Date(),
//       last_activity: new Date(),
//     };

//     return await prisma.user_sessions.create({ data });
//   }

//   static async removeUserSession(refreshToken: string): Promise<user_sessions | null> {
//     try {
//       const session = await prisma.user_sessions.findFirst({
//         where: { refresh_token: refreshToken },  // ✅ اسم الحقل الفعلي
//       });

//       if (session) {
//         return await prisma.user_sessions.delete({
//           where: { id: session.id },
//         });
//       }
//       return null;
//     } catch (error) {
//       console.error('Error removing user session:', error);
//       return null;
//     }
//   }

//   static async findUserSession(refreshToken: string): Promise<user_sessions | null> {
//     try {
//       return await prisma.user_sessions.findFirst({
//         where: { refresh_token: refreshToken },  // ✅ اسم الحقل الفعلي
//       });
//     } catch (error) {
//       console.error('Error finding user session:', error);
//       return null;
//     }
//   }

//   // ✅ تنظيف الـ tokens المنتهية الصلاحية
//   static async cleanupExpiredTokens(): Promise<number> {
//     try {
//       const result = await prisma.tokens.deleteMany({
//         where: {
//           expires_at: {              // ✅ اسم الحقل الفعلي
//             lt: new Date(),
//           },
//         },
//       });
//       return result.count;
//     } catch (error) {
//       console.error('Error cleaning up expired tokens:', error);
//       return 0;
//     }
//   }

//   // ✅ التحقق من صحة الـ access token
//   static async verifyAccessToken(token: string): Promise<{ userId: number } | null> {
//     try {
//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: number };
//       return decoded;
//     } catch (error) {
//       return null;
//     }
//   }

//   // ✅ التحقق من صحة الـ refresh token
//   static async verifyRefreshToken(token: string): Promise<{ userId: number } | null> {
//     try {
//       const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: number };
      
//       // التحقق من وجود الـ token في قاعدة البيانات
//       const dbToken = await prisma.tokens.findFirst({
//         where: { 
//           token: token,
//         },
//       });

//       // ✅ استخدام الأسماء الفعلية للحقول
//       if (!dbToken || !dbToken.is_active || dbToken.expires_at < new Date()) {
//         return null;
//       }

//       return decoded;
//     } catch (error) {
//       return null;
//     }
//   }

//   // ✅ دالة إضافية للحصول على جميع tokens المفعلة لمستخدم معين
//   static async getActiveTokensForUser(userId: number): Promise<tokens[]> {
//     try {
//       return await prisma.tokens.findMany({
//         where: {
//           user_id: userId,           // ✅ اسم الحقل الفعلي
//           is_active: true,           // ✅ اسم الحقل الفعلي
//           expires_at: {              // ✅ اسم الحقل الفعلي
//             gt: new Date(),
//           },
//         },
//       });
//     } catch (error) {
//       console.error('Error getting active tokens:', error);
//       return [];
//     }
//   }

//   // ✅ دالة لإلغاء تفعيل جميع tokens لمستخدم معين
//   static async deactivateAllUserTokens(userId: number): Promise<boolean> {
//     try {
//       await prisma.tokens.updateMany({
//         where: {
//           user_id: userId,           // ✅ اسم الحقل الفعلي
//         },
//         data: {
//           is_active: false,          // ✅ اسم الحقل الفعلي
//         },
//       });
//       return true;
//     } catch (error) {
//       console.error('Error deactivating user tokens:', error);
//       return false;
//     }
//   }
// }

import { prisma } from '../lib/prisma';
import { users, user_sessions, tokens } from '@prisma/client';
import { Prisma } from '@prisma/client';

// الواجهات تبقى كما هي لأنها تصف شكل البيانات
interface TokenWithUser extends tokens {
  users?: users;
}

interface SessionData {
  userId: number;
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}

/**
 * هذا الكلاس الآن مسؤول فقط عن عمليات قاعدة البيانات المتعلقة بالتوكنات والجلسات.
 * لا يوجد به أي منطق لإنشاء أو التحقق من JWTs.
 */
export class Token {

  /**
   * @description يحفظ refresh token جديد في قاعدة البيانات، ويحذف أي توكنات قديمة لنفس المستخدم.
   * @param userId - معرّف المستخدم.
   * @param refreshToken - سلسلة الـ refresh token.
   * @param expiresAt - تاريخ انتهاء صلاحية التوكن.
   * @returns {Promise<tokens>} - سجل التوكن الذي تم إنشاؤه.
   */
  static async saveRefreshToken(userId: number, refreshToken: string, expiresAt: Date): Promise<tokens> {
    try {
      // حذف جميع التوكنات السابقة النشطة لهذا المستخدم لضمان جلسة واحدة لكل عملية تسجيل دخول
      await prisma.tokens.deleteMany({
        where: { user_id: userId },
      });

      // حفظ التوكن الجديد
      const data: Prisma.tokensUncheckedCreateInput = {
        user_id: userId,
        token: refreshToken,
        type: 'refresh',
        expires_at: expiresAt, // استخدام تاريخ الانتهاء المُمرر
        created_at: new Date(),
        is_active: true,
      };

      return await prisma.tokens.create({ data });
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw new Error('Failed to save refresh token');
    }
  }

  /**
   * @description يبحث عن refresh token في قاعدة البيانات ويُرجع السجل مع بيانات المستخدم المرتبط به.
   * @param refreshToken - سلسلة الـ refresh token.
   * @returns {Promise<TokenWithUser | null>} - سجل التوكن أو null.
   */
  static async findRefreshToken(refreshToken: string): Promise<TokenWithUser | null> {
    try {
      return await prisma.tokens.findFirst({
        where: {
          token: refreshToken,
          is_active: true, // ضمان أن التوكن فعال
          expires_at: { gt: new Date() } // وضمان أنه لم تنتهِ صلاحيته
        },
        include: { users: true },
      });
    } catch (error) {
      console.error('Error finding refresh token:', error);
      return null;
    }
  }

  /**
   * @description يحذف refresh token معين من قاعدة البيانات.
   * @param refreshToken - سلسلة الـ refresh token.
   * @returns {Promise<tokens | null>} - السجل المحذوف أو null.
   */
  static async removeRefreshToken(refreshToken: string): Promise<tokens | null> {
    try {
      const tokenToDelete = await prisma.tokens.findFirst({
        where: { token: refreshToken },
      });

      if (tokenToDelete) {
        return await prisma.tokens.delete({
          where: { id: tokenToDelete.id },
        });
      }
      return null;
    } catch (error) {
      console.error('Error removing refresh token:', error);
      return null;
    }
  }

  /**
 * @description يحذف جميع refresh tokens الخاصة بمستخدم معين باستخدام user_id.
 * @param userId - رقم معرف المستخدم (number).
 * @returns {Promise<boolean>} - true إذا تم الحذف بنجاح.
 */
static async removeRefreshTokenByUserId(userId: number): Promise<boolean> {
  try {
    const result = await prisma.tokens.deleteMany({
      where: {
        user_id: userId
      }
    });
    return result.count > 0;
  } catch (error) {
    console.error('Error removing refresh tokens by user ID:', error);
    return false;
  }
}

  // --- دوال التعامل مع جلسات المستخدم (user_sessions) - تبقى كما هي ---

  static async storeUserSession(sessionData: SessionData): Promise<user_sessions> {
    const data: Prisma.user_sessionsUncheckedCreateInput = {
      user_id: sessionData.userId,
      refresh_token: sessionData.refreshToken,
      device_info: sessionData.deviceInfo,
      ip_address: sessionData.ipAddress,
      created_at: new Date(),
      last_activity: new Date(),
    };
    return await prisma.user_sessions.create({ data });
  }

  static async removeUserSession(refreshToken: string): Promise<user_sessions | null> {
    // ... الكود يبقى كما هو
    try {
        const session = await prisma.user_sessions.findFirst({
            where: { refresh_token: refreshToken },
        });

        if (session) {
            return await prisma.user_sessions.delete({
                where: { id: session.id },
            });
        }
        return null;
    } catch (error) {
        console.error('Error removing user session:', error);
        return null;
    }
  }

  // --- دوال الصيانة والإدارة - تبقى كما هي ---

  static async cleanupExpiredTokens(): Promise<number> {
    // ... الكود يبقى كما هو
    try {
        const result = await prisma.tokens.deleteMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
    }
  }

  static async deactivateAllUserTokens(userId: number): Promise<boolean> {
    // ... الكود يبقى كما هو
    try {
        await prisma.tokens.updateMany({
            where: {
                user_id: userId,
            },
            data: {
                is_active: false,
            },
        });
        return true;
    } catch (error) {
        console.error('Error deactivating user tokens:', error);
        return false;
    }
  }
}