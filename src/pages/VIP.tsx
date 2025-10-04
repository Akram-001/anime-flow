import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle2 } from "lucide-react";

export const VIP = () => {
  const plans = [
    {
      title: "1 Month",
      price: "$4.99",
      benefits: [
        "Remove all ads",
        "Access to exclusive anime",
        "HD Streaming 1080p",
        "Priority support"
      ],
    },
    {
      title: "6 Months",
      price: "$24.99",
      benefits: [
        "Save 20% vs monthly",
        "Early access to new features",
        "Exclusive VIP badge",
        "All 1-Month benefits"
      ],
    },
    {
      title: "12 Months",
      price: "$44.99",
      benefits: [
        "Save 35% vs monthly",
        "Lifetime VIP Discord role",
        "Beta testing access",
        "All 6-Month benefits"
      ],
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Upgrade to VIP</h1>
          <p className="text-muted-foreground mt-2">
            Unlock premium features and enjoy the ultimate anime experience!
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className="glass border-primary/30 p-6 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <h2 className="text-2xl font-semibold text-center mb-2">
                  {plan.title}
                </h2>
                <p className="text-center text-3xl font-bold text-primary mb-6">
                  {plan.price}
                </p>

                <ul className="space-y-3">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button className="w-full">Choose {plan.title}</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default VIP;