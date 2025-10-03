import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    // Return admin data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword
    })
  } catch (error) {
    console.error('Error in admin login:', error)
    return NextResponse.json(
      { error: 'خطا در ورود' },
      { status: 500 }
    )
  }
}
