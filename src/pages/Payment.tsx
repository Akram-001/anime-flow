// src/pages/Payment.tsx
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Clock, Info } from "lucide-react";

const FakePayment = () => {
  const [plan, setPlan] = useState("1 Month - $4.99");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const plans = [
    "1 Month - $4.99",
    "6 Months - $24.99",
    "12 Months - $44.99",
  ];

  const handleFakePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // fake processing delay
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 900);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              This page is for payment; if you are serious, continue reading. 
            </p>
          </div>

          {!done ? (
            <form onSubmit={handleFakePay} className="grid gap-6 md:grid-cols-2">
              {/* Left: Plan & summary */}
              <Card className="p-6 glass border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Selected Plan
                </h2>

                <div className="space-y-3">
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded border bg-transparent"
                    aria-label="Select plan"
                  >
                    {plans.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 p-3 rounded border bg-muted/20">
                    <p className="text-sm text-muted-foreground">Summary</p>
                    <p className="text-lg font-semibold">{plan}</p>
                    <p className="text-sm mt-2">Benefits included:</p>
                    <ul className="list-disc list-inside text-sm mt-2">
                      <li>Remove all ads</li>
                      <li>Access to exclusive content</li>
                      <li>HD streaming</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span>This page is a mock. No actual transaction will happen.</span>
                  </div>
                </div>
              </Card>

              {/* Right: Card form */}
              <Card className="p-6 glass border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Billing Details
                </h2>

                <div className="space-y-3">
                  <label className="text-sm">Name on card</label>
                  <Input
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={processing}
                  />

                  <label className="text-sm">Card number</label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    disabled={processing}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm">Exp</label>
                      <Input
                        placeholder="MM/YY"
                        value={exp}
                        onChange={(e) => setExp(e.target.value)}
                        disabled={processing}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm">CVC</label>
                      <Input
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        disabled={processing}
                      />
                    </div>
                  </div>

                  {/* Fake pay button */}
                  <div className="mt-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      {processing ? "Processing..." : `Pay (Mock) — ${plan.split(" - ")[1]}`}
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    This is a decorative checkout for demo purposes only.
                  </div>
                </div>
              </Card>

              {/* Full width notice under form */}
              <div className="md:col-span-2">
                <Card className="p-4 glass border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="font-semibold">Fake transaction</div>
                      <div className="text-sm text-muted-foreground">
                        No payment library is included. Use this page as UI only.
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-right text-sm">Need a real payment flow?</div>
                    <div className="text-right text-xs text-muted-foreground">
                      Integrate Stripe/PayPal backend when ready.
                    </div>
                  </div>
                </Card>
              </div>
            </form>
          ) : (
            <Card className="p-8 text-center glass border-primary/20">
              <CheckCircle2 className="mx-auto w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment simulated</h2>
              <p className="text-muted-foreground mb-6">
                This was a mock transaction. No money was charged.
              </p>
              <Button onClick={() => { setDone(false); setName(""); setCard(""); setExp(""); setCvc(""); }}>
                Back to Checkout
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FakePayment;