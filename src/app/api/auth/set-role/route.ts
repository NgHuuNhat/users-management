import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { role } = await request.json();
    
    // Phải có "await" ở đây vì cookies() giờ là một Promise
    const cookieStore = await cookies();
    
    cookieStore.set('user-role', role, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // Tự động bật secure khi deploy
        maxAge: 60 * 60 * 24,
        path: '/' 
    });

    return NextResponse.json({ success: true });
}