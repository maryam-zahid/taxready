"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  updatePracticeSettingsAction,
  type UpdatePracticeSettingsInput,
} from "./actions";
type PracticeTypeValue =
  | "INDEPENDENT_TAX_PROFESSIONAL"
  | "TAX_ACCOUNTING_FIRM"
  | "OTHER";

type Props = {
  initialValues: UpdatePracticeSettingsInput;
};

function formatPracticeType(value: PracticeTypeValue) {
      switch (value) {
    case "INDEPENDENT_TAX_PROFESSIONAL":
      return "Independent Tax Professional";

    case "TAX_ACCOUNTING_FIRM":
      return "Tax / Accounting Firm";

    case "OTHER":
      return "Other";

    default:
      return value;
  }
}

export function PracticeSettingsForm({
  initialValues,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof UpdatePracticeSettingsInput>(
    field: K,
    value: UpdatePracticeSettingsInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function cancelEditing() {
    setForm(initialValues);
    setMessage("");
    setSuccess(false);
    setEditing(false);
  }

  function save() {
    setMessage("");
    setSuccess(false);

    startTransition(async () => {
      const result =
        await updatePracticeSettingsAction(form);

      setMessage(result.message);
      setSuccess(result.success);

      if (result.success) {
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div>
        <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
          <Detail
            label="Practice name"
            value={form.name}
          />

          <Detail
            label="Practice type"
            value={formatPracticeType(
              form.practiceType,
            )}
          />

          <Detail
            label="Business email"
            value={
              form.businessEmail || "Not provided"
            }
          />

          <Detail
            label="Business phone"
            value={
              form.businessPhone || "Not provided"
            }
          />

          <Detail
            label="NTN"
            value={form.ntn || "Not provided"}
          />

          <Detail
            label="Website"
            value={form.website || "Not provided"}
          />

          <Detail
            label="Country"
            value={form.country}
          />

          <Detail
            label="City"
            value={form.city || "Not provided"}
          />

          <div className="sm:col-span-2">
            <Detail
              label="Business address"
              value={
                form.address || "Not provided"
              }
            />
          </div>
        </div>

        {message && success && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-end border-t pt-5">
          <Button
            type="button"
            onClick={() => {
              setMessage("");
              setSuccess(false);
              setEditing(true);
            }}
          >
            <Pencil className="size-4" />
            Edit practice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Practice name"
          value={form.name}
          onChange={(value) =>
            updateField("name", value)
          }
        />

        <div className="space-y-2">
          <Label htmlFor="practiceType">
            Practice type
          </Label>

          <select
            id="practiceType"
            value={form.practiceType}
           onChange={(event) =>
  updateField(
    "practiceType",
    event.target.value as PracticeTypeValue,
  )
}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option
              value={
"INDEPENDENT_TAX_PROFESSIONAL"
              }
            >
              Independent Tax Professional
            </option>

            <option
              value={
"TAX_ACCOUNTING_FIRM"
              }
            >
              Tax / Accounting Firm
            </option>

            <option value={"OTHER"}>
              Other
            </option>
          </select>
        </div>

        <Field
          label="Business email"
          type="email"
          value={form.businessEmail}
          placeholder="practice@example.com"
          onChange={(value) =>
            updateField("businessEmail", value)
          }
        />

        <Field
          label="Business phone"
          type="tel"
          value={form.businessPhone}
          placeholder="+92 300 1234567"
          onChange={(value) =>
            updateField("businessPhone", value)
          }
        />

        <Field
          label="NTN"
          value={form.ntn}
          placeholder="Enter NTN"
          onChange={(value) =>
            updateField("ntn", value)
          }
        />

        <Field
          label="Website"
          type="url"
          value={form.website}
          placeholder="https://example.com"
          onChange={(value) =>
            updateField("website", value)
          }
        />

        <Field
          label="Country"
          value={form.country}
          onChange={(value) =>
            updateField("country", value)
          }
        />

        <Field
          label="City"
          value={form.city}
          onChange={(value) =>
            updateField("city", value)
          }
        />

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="practice-address">
            Business address
          </Label>

          <Input
            id="practice-address"
            value={form.address}
            placeholder="Office or practice address"
            onChange={(event) =>
              updateField(
                "address",
                event.target.value,
              )
            }
          />
        </div>
      </div>

      {message && !success && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {message}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={cancelEditing}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={isPending}
          onClick={save}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = label
    .toLowerCase()
    .replaceAll(" ", "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}