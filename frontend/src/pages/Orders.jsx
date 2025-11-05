import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Truck,
  PackageCheck,
  CircleAlert,
  CircleCheck,
  Ban,
} from "lucide-react";
import Loader from "../components/CompLoader";
import SmallNavBar from "../components/SmallNavBar";
import { assets } from "../assets/assets";

const Orders = () => {
  const {
    orders,
    loadingOrders,
    fetchOrders,
    currency,
    token,
    navigate,
  } = useContext(ShopContext);

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (token) {
      if (initialLoad) {
        fetchOrders();
        setInitialLoad(false);
      }
    } else {
      navigate("/login");
    }
  }, [token, fetchOrders, navigate, initialLoad]);

  if (loadingOrders && orders.length === 0) return <Loader />;

  const filterOrders = (status) => {
    switch (status) {
      case "onShipping":
        return orders.filter(
          (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
      case "arrived":
        return orders.filter((o) => o.status === "Delivered");
      case "cancelled":
        return orders.filter((o) => o.status === "Cancelled");
      default:
        return orders;
    }
  };

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-10">
      <SmallNavBar navs={["Orders"]} />
      <div className="border-t pt-6">
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

        {/* Tabs */}
        <Tabs defaultValue="onShipping" className="w-full">
          <TabsList className="flex justify-center mb-6 bg-muted/30 rounded-full w-fit mx-auto">
            <TabsTrigger
              value="onShipping"
              className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
            >
              On Shipping
            </TabsTrigger>
            <TabsTrigger
              value="arrived"
              className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
            >
              Arrived
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          {["onShipping", "arrived", "cancelled"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <ScrollArea className="h-[70vh] pr-2">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterOrders(tab).length === 0 ? (
                    <p className="text-center text-muted-foreground py-10 col-span-full">
                      No orders found.
                    </p>
                  ) : (
                    filterOrders(tab).map((order, idx) => (
                      <Card
                        key={idx}
                        className="rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <CardHeader className="pb-3 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Order ID
                              </p>
                              <p className="font-semibold">
                                #{order._id.slice(-9)}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between items-center">
                            <span>{order.from || "Warehouse"}</span>
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span>{order.to || "Your Address"}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 border rounded-md p-2"
                            >
                              <img
                                src={item.image[0]}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-md"
                              />
                              <div>
                                <p className="text-sm font-medium truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Size: {item.size} × {item.quantity}
                                </p>
                                <p className="text-sm font-semibold">
                                  {currency}
                                  {item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>

                        <CardFooter className="flex justify-between items-center border-t pt-3">
                          <p className="text-sm">
                            Total:{" "}
                            <span className="font-semibold">
                              {currency}
                              {order.amount}
                            </span>
                          </p>
                          <Button
                            variant="default"
                            size="sm"
                            className="rounded-full px-4"
                            onClick={() => navigate(`/order/${order._id}`)}
                          >
                            Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

// 🏷️ Status Badge Component
const StatusBadge = ({ status }) => {
  switch (status) {
    case "Delivered":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          <CircleCheck className="w-3 h-3 mr-1" /> Delivered
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700">
          <Ban className="w-3 h-3 mr-1" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700">
          <PackageCheck className="w-3 h-3 mr-1" /> On Shipping
        </Badge>
      );
  }
};

export default Orders;
