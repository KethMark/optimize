"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/validate";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      data: Pick<AuthCredentials, "email" | "fullName" | "password">
    ): Promise<AuthCredentials> => {
      const response = await axios.post("/api/signup", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message)
      console.log("Being redirect even not success")
      router.push('/signin')
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorMessage = error.response.data.message
        toast.error(errorMessage);
        console.log("Not Being redirect:", errorMessage);

        if(errorMessage.includes('Email')) {
          form.setError('email', {
            type: 'server',
            message: errorMessage
          }) 
        } else if (errorMessage.includes("Password")) {
          form.setError("password", {
            type: "server",
            message: errorMessage
          });
        } else {
          form.setError("email", {
            type: "server",
            message: errorMessage
          });
          form.setError("password", {
            type: "server",
            message: errorMessage
          });
        }
      }
    }
  });

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    mutation.mutate(values)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Create an account</h1>
                  <p className="text-balance text-muted-foreground">
                    Sign up for your Acme Inc account
                  </p>
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  Sign Up
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Sign up with GitHub
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/signin" className="underline underline-offset-4">
                    sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/vercel.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking sign up, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
