import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { roomName, participantName, participantId } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json({ error: "roomName and participantName are required" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit credentials not configured" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantId || participantName,
      name: participantName,
      ttl: "4h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}