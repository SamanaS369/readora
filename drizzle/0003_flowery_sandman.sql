CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_uuid" text NOT NULL,
	"amount" text NOT NULL,
	"product_code" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reference_id" text,
	"transaction_code" text,
	"payment_method" text DEFAULT 'esewa' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_transaction_uuid_unique" UNIQUE("transaction_uuid")
);
