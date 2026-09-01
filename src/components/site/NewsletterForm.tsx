import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/cms.functions";

export function NewsletterForm({ buttonLabel = "Subscribe", successMessage = "You are subscribed!" }) {
  const subscribe = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await subscribe({ data: { email } });
          toast.success(successMessage, { position: "top-center" });
          setEmail("");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not subscribe", { position: "top-center" });
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        required
        maxLength={255}
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={busy}>
        {buttonLabel}
      </Button>
    </form>
  );
}
