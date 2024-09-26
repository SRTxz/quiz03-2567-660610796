import { DataBase, DB, Payload, readDB, Room, writeDB,User } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
let totalRooms: null;
export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: (<DataBase>DB).rooms,
    totalRooms: (<DataBase>DB).rooms.length
  });
};

export const POST = async (request: NextRequest) => {
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
  if (!(role === "ADMIN" || role === "SUPER_ADMIN")) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { roomName } = body;
  readDB();
  const foundroom = (<DataBase>DB).rooms.find((x) => x.roomName === roomName)
  if(foundroom){
    return NextResponse.json(
    {
    ok: false,
    message: `Room ${roomName} already exists`,
    },
    { status: 400 }
    );  
  }
  

  const roomId = nanoid();

  //call writeDB after modifying Database
  (<DataBase>DB).rooms.push({
    roomId,
    roomName
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    roomId,
    message: `Room ${roomName} has been created`,
  });
};
