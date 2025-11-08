// src/pages/Payment.tsx
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Clock } from "lucide-react";

const Payment = () => {
  const [plan, setPlan] = useState("1 Month - $4.99");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const plans = [
    { label: "1 Month", price: "$4.99" },
    { label: "6 Months", price: "$24.99" },
    { label: "12 Months", price: "$44.99" },
  ];

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !card || !exp || !cvc) return alert("Please fill all fields");
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 900);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold gradient-text">Checkout</h1>
            <p className="text-muted-foreground mt-2">Choose your plan and finish payment.</p>
          </div>

          {!done ? (
            <form onSubmit={handlePayment} className="grid gap-6 md:grid-cols-2">
              {/* LEFT: Plan */}
              <Card className="p-6 glass border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Selected Plan
                </h2>

                <div className="flex flex-wrap gap-3 mb-4">
                  {plans.map((p) => {
                    const selected = plan === `${p.label} - ${p.price}`;
                    return (
                      <Button
                        key={p.label}
                        type="button"
                        onClick={() => setPlan(`${p.label} - ${p.price}`)}
                        disabled={processing}
                        variant={selected ? "default" : "outline"}
                        className={`flex-1 min-w-[120px] h-[70px] flex flex-col justify-center items-center transition-all duration-300
                          ${selected ? "ring-2 ring-primary border-primary" : "border-muted hover:ring-1 hover:ring-primary/50"}`}
                      >
                        <span className="text-sm font-medium">{p.label}</span>
                        <span className="text-xs text-muted-foreground">{p.price}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="p-3 rounded border bg-muted/10">
                  <p className="text-sm text-muted-foreground mb-1">Summary</p>
                  <p className="text-lg font-semibold">{plan}</p>
                  <ul className="list-disc list-inside text-sm mt-2 text-muted-foreground">
                    <li>Remove all ads</li>
                    <li>Access to exclusive content</li>
                    <li>HD streaming</li>
                  </ul>
                </div>
              </Card>

              {/* RIGHT: Billing */}
              <Card className="p-6 glass border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Billing Details
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm">Name on card</label>
                    <Input
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-sm">Card number</label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      disabled={processing}
                    />
                  </div>

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

                  <Button type="submit" className="w-full mt-4" disabled={processing}>
                    {processing ? "Processing..." : `Pay ${plan.split(" - ")[1]}`}
                  </Button>
                </div>
              </Card>
            </form>
          ) : (
            <Card className="p-8 text-center glass border-primary/20">
              <CheckCircle2 className="mx-auto w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Completed</h2>
              <p className="text-muted-foreground mb-6">Your subscription has been activated successfully.</p>
              <Button
                onClick={() => {
                  setDone(false);
                  setName("");
                  setCard("");
                  setExp("");
                  setCvc("");
                }}
              >
                Back to Checkout
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Payment;