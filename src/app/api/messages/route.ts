import { DB, readDB, writeDB, Message ,DataBase, Payload} from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
readDB();
const roomId = request.nextUrl.searchParams.get("roomId");
const foundroom = (<DataBase>DB).rooms.find((x) => x.roomId === roomId)
if(!foundroom){
  return NextResponse.json(
    {
      ok: false,
      message: `Room is not found`,
    },
    { status: 404 }
  );
}
(<DataBase>DB).messages = (<DataBase>DB).messages.filter((x) => x.roomId === roomId)
return NextResponse.json(
  {
    ok: true,
    messages : (<DataBase>DB).messages
  }
);
  
};

export const POST = async (request: NextRequest) => {
  readDB();
  const body = await request.json();
  const {roomId,messageText} = body;
  const foundroom = (<DataBase>DB).rooms.find((x) => x.roomId === roomId)
  if(!foundroom){
    return NextResponse.json(
    {
      ok: false,
      message: `Room is not found`,
    },
    { status: 404 }
    );
  }
  

  const messageId = nanoid();
  (<DataBase>DB).messages.push(
    {
      roomId,
      messageId,
      messageText
    }
  )
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  const {role} = <Payload>payload;
  if(role !== "SUPER_ADMIN"){
    return NextResponse.json(
    {
      ok: false,
      message: "Invalid token",
    },
    { status: 401 }
    );
  }
  readDB();
  const body = await request.json();
  const {messageId} = body;
  const foundMessageIndex = (<DataBase>DB).messages.findIndex((x) => x.messageId === messageId);
  if(foundMessageIndex === -1){
    return NextResponse.json(
    {
      ok: false,
      message: "Message is not found",
    },
    { status: 404 }
    );
  }
  
  (<DataBase>DB).messages.splice(foundMessageIndex,1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
