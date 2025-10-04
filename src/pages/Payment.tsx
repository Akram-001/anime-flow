import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Layout } from "@/components/Layout";

const Payment = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-6">Complete Your Payment</h1>
        <div className="max-w-md mx-auto bg-white dark:bg-black p-6 rounded-2xl shadow-lg">
          <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: "4.99", // السعر بالدولار (غيره حسب الباقة)
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                const details = await actions.order?.capture();
                alert(`Transaction completed by ${details?.payer.name?.given_name}`);
                // هنا تقدر تحدث حالة العضوية VIP في قاعدة البيانات
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;