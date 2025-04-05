/*export async function GET(req: Request) {
    try {
        return new Response(JSON.stringify({ message: 'SUCCESS' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: `${err}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}*/
import { NextResponse } from 'next/server';
import { db } from '@/db/db.ts';

export async function GET() {
    const usersList = await db.selectFrom('users').selectAll().execute();
    return NextResponse.json(usersList);
}
