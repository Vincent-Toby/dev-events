import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

// GET handler to fetch event details by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Connect to the database
    await connectToDatabase();

    // 2. Extract slug from parameters
    const { slug } = await params;

    // 3. Validate slug presence
    if (!slug) {
      return NextResponse.json(
        { message: "Missing event slug in URL" },
        { status: 400 }
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // 6. Return the event details as JSON
    return NextResponse.json(
      { message: "Event details fetched successfully", event },
      { status: 200 }
    );


  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching event by slug:", error);
    }

    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { message: "Database configuration error" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred", error: "Unknown" },
      { status: 500 }
    );
  }
}
