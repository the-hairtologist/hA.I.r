/**
 * Birthday Alerts Widget
 * Shows upcoming client birthdays
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay, addDays } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BirthdayClient {
  id: string;
  full_name: string;
  birthday: string;
  email?: string;
  phone?: string;
  days_until: number;
}

export function BirthdayAlertsWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingBirthdays();
  }, [user]);

  const loadUpcomingBirthdays = async () => {
    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) {
        setLoading(false);
        return;
      }

      // Get clients with birthdays
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id, full_name, birthday, email, phone")
        .eq("preferred_stylist_id", stylistProfile.id)
        .not("birthday", "is", null);

      if (error) throw error;

      // Filter and sort by upcoming birthdays (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);

      const upcoming = data
        .map((client) => {
          const birthday = new Date(client.birthday);
          const thisYearBirthday = new Date(
            today.getFullYear(),
            birthday.getMonth(),
            birthday.getDate()
          );

          // If birthday already passed this year, check next year
          let nextBirthday = thisYearBirthday;
          if (thisYearBirthday < today) {
            nextBirthday = new Date(
              today.getFullYear() + 1,
              birthday.getMonth(),
              birthday.getDate()
            );
          }

          const daysUntil = Math.ceil(
            (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            ...client,
            days_until: daysUntil,
          };
        })
        .filter((client) => client.days_until >= 0 && client.days_until <= 30)
        .sort((a, b) => a.days_until - b.days_until)
        .slice(0, 5);

      setUpcomingBirthdays(upcoming as BirthdayClient[]);
    } catch (error) {
      console.error("Error loading birthdays:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendBirthdayMessage = (client: BirthdayClient, method: "email" | "sms") => {
    if (method === "email" && client.email) {
      window.location.href = `mailto:${client.email}?subject=Happy Birthday ${client.full_name}! 🎉`;
    } else if (method === "sms" && client.phone) {
      window.location.href = `sms:${client.phone}`;
    } else {
      toast.error(`No ${method} available for this client`);
    }
  };

  const getBirthdayBadge = (daysUntil: number) => {
    if (daysUntil === 0) {
      return (
        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse">
          TODAY! 🎂
        </Badge>
      );
    } else if (daysUntil === 1) {
      return <Badge variant="default">Tomorrow</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge variant="secondary">This week</Badge>;
    } else {
      return (
        <Badge variant="outline">
          {daysUntil} days
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-5 w-5 text-pink-500" />
          Upcoming Birthdays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingBirthdays.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground space-y-2">
            <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No upcoming birthdays</p>
            <p className="text-xs">Add birthdays to client profiles to see alerts here</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clients")}
              className="mt-2"
            >
              Manage Clients
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBirthdays.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {client.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(client.birthday), "MMMM d")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {getBirthdayBadge(client.days_until)}
                  <div className="flex gap-1">
                    {client.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendBirthdayMessage(client, "email")}
                        className="h-7 w-7 p-0"
                        title="Send birthday email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {client.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendBirthdayMessage(client, "sms")}
                        className="h-7 w-7 p-0"
                        title="Send birthday SMS"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
