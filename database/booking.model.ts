import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose";
import Event from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Email must be a valid email address.",
      },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre("save", async function (this: HydratedDocument<IBooking>) {
  // Validate event reference before persisting to keep bookings relationally consistent.
  if (this.isNew || this.isModified("eventId")) {
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error("Cannot create booking for a non-existent event.");
    }
  }
});

const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking>) || model<IBooking>("Booking", bookingSchema);

export default Booking;
