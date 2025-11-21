import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { setCredentials } from "../../redux/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { useAppTranslation } from "@/i18n/hooks";
import LanguageSelector from "@/components/LanguageSelector";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



// Define the shape of the form data
interface LoginFormInputs {
  username: string;
  password: string;
}




const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useAppTranslation(['login', 'common']);

  const onSubmit = async (data: LoginFormInputs) => {
    const loadingToast = toast.loading(t('login:loading')); // ← AGREGAR login:
    try {
      // 1. Get Tokens
      const tokenResponse = await axiosInstance.post("/api/token/", data);
      const { access, refresh } = tokenResponse.data;
      localStorage.setItem('access_token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }

      // 2. Get User Info
      const userResponse = await axiosInstance.get("/api/v1/users/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      const user = userResponse.data;

      // 3. Set credentials
      dispatch(setCredentials({ user, token: access }));

      // 4. Set last activity timestamp
      localStorage.setItem('last_activity', Date.now().toString());
      
      toast.dismiss(loadingToast);
      navigate("/");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t('login:error')); // ← AGREGAR login:
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{t('login:title')}</CardTitle> {/* ← AGREGAR login: */}
              <CardDescription>
                {t('login:description')} {/* ← AGREGAR login: */}
              </CardDescription>
            </div>
            <LanguageSelector />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t('login:username_label')}</Label> {/* ← AGREGAR login: */}
              <Input
                id="username"
                type="text"
                placeholder={t('login:username_placeholder')}
                {...register("username", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('login:password_label')}</Label> {/* ← AGREGAR login: */}
              <Input
                id="password"
                type="password"
                placeholder={t('login:password_placeholder')} 
                {...register("password", { required: true })}
              />
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button type="submit" className="w-full">
              {t('login:button')} {/* ← AGREGAR login: */}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
