import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre zorunludur" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi girin" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || "Admin",
      },
    });

    if (authError) {
      console.error("[ADMIN_CREATE_AUTH_ERROR]", authError);
      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    // 2. Add to admin_users table using raw SQL (bypass schema cache issues)
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('create_admin_user', {
        p_user_id: authData.user.id,
        p_email: email,
        p_full_name: fullName || 'Admin'
      });

      if (rpcError) {
        // RPC yoksa doğrudan insert dene
        console.log("RPC not found, trying direct insert...");
        
        const { error: insertError } = await supabaseAdmin
          .from("admin_users")
          .insert({
            user_id: authData.user.id,
            email: email,
            full_name: fullName || "Admin",
            role: "admin",
          });

        if (insertError) {
          console.error("[ADMIN_INSERT_ERROR]", insertError);
          
          // Schema cache hatası mı?
          if (insertError.message.includes("schema cache")) {
            // Kullanıcıyı silme, admin sonradan manuel eklenebilir
            return NextResponse.json({
              success: true,
              warning: "Kullanıcı Auth'da oluşturuldu ama admin_users tablosuna eklenemedi (schema cache). Lütfen Supabase Dashboard > SQL Editor'de şunu çalıştırın:\n\nINSERT INTO admin_users (user_id, email, full_name, role) VALUES ('" + authData.user.id + "', '" + email + "', '" + (fullName || "Admin") + "', 'admin');",
              user: {
                id: authData.user.id,
                email: authData.user.email,
              },
            });
          }
          
          // Diğer hatalar için kullanıcıyı temizle
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          return NextResponse.json(
            { error: `Database error: ${insertError.message}` },
            { status: 500 }
          );
        }
      }
    } catch (dbError) {
      console.error("[ADMIN_DB_ERROR]", dbError);
      // Kullanıcıyı silme, manuel ekleme yapılabilir
      return NextResponse.json({
        partialSuccess: true,
        warning: "Auth kullanıcısı oluşturuldu ama admin kaydı yapılamadı. Manuel eklemeniz gerekebilir.",
        userId: authData.user.id,
        email: authData.user.email,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Admin kullanıcısı başarıyla oluşturuldu",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });

  } catch (error) {
    console.error("[ADMIN_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
