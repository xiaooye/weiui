"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  Input,
  Textarea,
  Button,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Stack,
  toast,
} from "@weiui/react";

type Values = {
  name: string;
  email: string;
  password: string;
  role: string;
  bio: string;
  terms: boolean;
};

type Errors = Partial<Record<keyof Values, string>>;

async function isEmailAvailable(email: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600));
  return email.toLowerCase() !== "taken@example.com";
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email.";
  if (values.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (!values.role) errors.role = "Pick a role so we can tailor the dashboard.";
  if (!values.terms) errors.terms = "You must agree to continue.";
  return errors;
}

export function SignupFormDemo() {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    password: "",
    role: "",
    bio: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [checking, setChecking] = useState(false);
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleEmailBlur() {
    if (!values.email) return;
    setChecking(true);
    try {
      const ok = await isEmailAvailable(values.email);
      if (!ok) setErrors((e) => ({ ...e, email: "That email is already in use." }));
    } finally {
      setChecking(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = validate(values);
    if (Object.values(validation).some(Boolean)) {
      setErrors(validation);
      return;
    }
    startTransition(async () => {
      await toast.promise(
        new Promise<{ name: string }>((resolve) => setTimeout(() => resolve({ name: values.name }), 900)),
        {
          loading: "Creating your account…",
          success: (data) => `Welcome, ${data.name}!`,
          error: "Something went wrong. Please retry.",
        },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 460 }} noValidate>
      <Stack gap={4}>
        <Field required error={errors.name}>
          <FieldLabel>Full name</FieldLabel>
          <Input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </Field>

        <Field required error={errors.email} validating={checking}>
          <FieldLabel>Work email</FieldLabel>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={handleEmailBlur}
            clearable
          />
          <FieldDescription>Try &apos;taken@example.com&apos; to see async validation.</FieldDescription>
        </Field>

        <Field required error={errors.password}>
          <FieldLabel>Password</FieldLabel>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
          />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>

        <Field required error={errors.role}>
          <FieldLabel>Role</FieldLabel>
          <Select value={values.role} onValueChange={(v) => setField("role", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick one…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="pm">Product manager</SelectItem>
              <SelectItem value="founder">Founder</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Bio</FieldLabel>
          <Textarea
            name="bio"
            rows={3}
            value={values.bio}
            onChange={(e) => setField("bio", e.target.value)}
            maxLength={240}
            showCount
          />
          <FieldDescription>Tell us a little about what you&apos;re building.</FieldDescription>
        </Field>

        <Checkbox
          label="I agree to the terms."
          checked={values.terms}
          onChange={(e) => setField("terms", e.target.checked)}
        />
        {errors.terms && (
          <div role="alert" style={{ color: "var(--wui-color-destructive)", fontSize: "var(--wui-font-size-sm)" }}>
            {errors.terms}
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--wui-spacing-2)" }}>
          <Button type="submit" disabled={pending || checking}>
            {pending ? "Creating…" : "Create account"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setValues({ name: "", email: "", password: "", role: "", bio: "", terms: false });
              setErrors({});
            }}
          >
            Reset
          </Button>
        </div>
      </Stack>
    </form>
  );
}
