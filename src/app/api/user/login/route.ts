import jwt from "jsonwebtoken";

import { DB, readDB,DataBase } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";
import { checkToken } from "@lib/checkToken";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { username, password } = body;
  readDB();
  
  const user = (<DataBase>DB).users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Username or Password is incorrect",
      },
      { status: 400 }
    );
  };
  const secret = process.env.JWT_SECRET || "This is another secret";
  const token = jwt.sign(
    { username, role: user.role },
    secret,
    { expiresIn: "8h" }
  );

  return NextResponse.json({ ok: true, token });
};
