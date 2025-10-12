import React from "react";
import {
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const CONTACT_CHANNELS = [
  {
    title: "General Enquiries",
    icon: Phone,
    value: "+254 711 082 146",
    href: "tel:+254711082146",
    helper: "Reception & student support",
  },
  {
    title: "WhatsApp Support",
    icon: PhoneCall,
    value: "+254 712 293 878",
    href: "https://wa.me/254712293878",
    helper: "Quick questions & follow-ups",
  },
  {
    title: "Corporate Inquiries",
    icon: Users,
    value: "0738 368 319",
    href: "tel:+254738368319",
    helper: "Partnerships & hiring",
  },
];

const EMAIL_CHANNELS = [
  {
    label: "General inbox",
    email: "contact@moringaschool.com",
  },
  {
    label: "Admissions",
    email: "admissions@moringaschool.com",
  },
  {
    label: "Corporate",
    email: "corporate@moringaschool.com",
  },
  {
    label: "Career services",
    email: "careerservices@moringaschool.com",
  },
];

export function ContactPage() {
  return (
    <div className="bg-background">
      <section className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700">Contact MoringaDesk</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            We’re here to help you grow
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Whether you’re a learner, partner, or alumni, the Moringa team is ready to answer your
            questions. Reach us through the channels below or visit the campus.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-emerald-600 px-6 text-sm font-semibold hover:bg-emerald-700">
              <a href="mailto:contact@moringaschool.com">Send us an email</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <a href="https://wa.me/254712293878" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
          <div className="space-y-6">
            <Card className="border-emerald-100 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  Call or message us
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 p-0">
                {CONTACT_CHANNELS.map((channel) => (
                  <div
                    key={channel.title}
                    className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <channel.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{channel.title}</p>
                      <a
                        href={channel.href}
                        className="text-sm text-emerald-600 underline-offset-4 hover:underline"
                        target={channel.href.startsWith("http") ? "_blank" : undefined}
                        rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {channel.value}
                      </a>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{channel.helper}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  Email directories
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-2">
                {EMAIL_CHANNELS.map(({ label, email }) => (
                  <div key={email}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                    <a href={`mailto:${email}`} className="break-all font-semibold text-emerald-600 hover:underline">
                      {email}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm">
              <CardContent className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-start">
                <Clock className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Support hours</p>
                  <p className="text-sm text-slate-600">
                    Monday – Friday, 9:00 AM – 5:00 PM EAT. For urgent queries outside these hours, drop
                    us an email and we’ll respond first thing next business day.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="border-emerald-100 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Visit the campus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-6 py-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  Ngong Lane Plaza, 1st Floor
                </p>
                <p>Ngong Lane, Nairobi, Kenya</p>
                <p>P.O Box 28860 - 00100, Nairobi</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Walk-ins welcome on weekdays. Book in advance for cohort tours or partner visits.
                </p>
              </CardContent>
            </Card>

            <div className="h-[260px] overflow-hidden rounded-3xl border border-slate-200 shadow-sm sm:h-[320px] md:h-[360px]">
              <iframe
                title="Moringa School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8036555757204!2d36.7923525!3d-1.2989507999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d94ab3fb61%3A0x5062342635ee11ad!2sNgong%20Lane%20Plaza%2C%20Ngong%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                className="h-full w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <Card className="border-emerald-100 shadow-sm">
              <CardContent className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-start">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Need help on MoringaDesk?</p>
                  <p className="text-sm text-slate-600">
                    Reach us directly from the platform by opening the support panel or tagging{" "}
                    <span className="font-semibold text-slate-800">@moringa-support</span> in your
                    question.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
