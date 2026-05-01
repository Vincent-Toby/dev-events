import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export interface IEvent {
  id: number;
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TIME_24_HOUR_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const TIME_12_HOUR_REGEX = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/;

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const toIsoDate = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  return parsedDate.toISOString();
};

const to24HourTime = (value: string): string => {
  const input = value.trim();
  const twentyFourHourMatch = input.match(TIME_24_HOUR_REGEX);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const twelveHourMatch = input.match(TIME_12_HOUR_REGEX);

  if (!twelveHourMatch) {
    throw new Error("Invalid time format. Use HH:mm or h:mm AM/PM.");
  }

  let hour = Number(twelveHourMatch[1]);
  const minutes = Number(twelveHourMatch[2]);
  const period = twelveHourMatch[3].toUpperCase();

  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (items: string[]) =>
          items.length > 0 && items.every((item) => item.trim().length > 0),
        message: "Agenda must contain at least one non-empty item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (items: string[]) =>
          items.length > 0 && items.every((item) => item.trim().length > 0),
        message: "Tags must contain at least one non-empty item.",
      },
    },
  },
  { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function (this: HydratedDocument<IEvent>) {
  const requiredTextFields: Array<{ name: string; value: string }> = [
    { name: "title", value: this.title },
    { name: "description", value: this.description },
    { name: "overview", value: this.overview },
    { name: "image", value: this.image },
    { name: "venue", value: this.venue },
    { name: "location", value: this.location },
    { name: "date", value: this.date },
    { name: "time", value: this.time },
    { name: "mode", value: this.mode },
    { name: "audience", value: this.audience },
    { name: "organizer", value: this.organizer },
  ];

  // Guard against empty required text values after trimming.
  for (const field of requiredTextFields) {
    if (field.value.trim().length === 0) {
      throw new Error(`${field.name} is required and cannot be empty.`);
    }
  }

  if (this.agenda.length === 0 || this.agenda.some((item) => item.trim().length === 0)) {
    throw new Error("Agenda is required and cannot contain empty items.");
  }

  if (this.tags.length === 0 || this.tags.some((item) => item.trim().length === 0)) {
    throw new Error("Tags are required and cannot contain empty items.");
  }

  // Keep slug in sync with title, but only when title changes.
  if (this.isModified("title")) {
    const generatedSlug = toSlug(this.title);

    if (!generatedSlug) {
      throw new Error("Unable to generate a valid slug from title.");
    }

    this.slug = generatedSlug;
  }

  // Normalize date/time into consistent storage formats.
  if (this.isModified("date") || this.isNew) {
    this.date = toIsoDate(this.date);
  }

  if (this.isModified("time") || this.isNew) {
    this.time = to24HourTime(this.time);
  }
});

const Event: Model<IEvent> = (models.Event as Model<IEvent>) || model<IEvent>("Event", eventSchema);

export default Event;
