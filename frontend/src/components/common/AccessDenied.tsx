import { useTranslation } from "react-i18next";
import { LockKeyhole, Home, Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


export const AccessDenied = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div>
        <Card className="max-w-lg w-full shadow-lg">
          <CardHeader className="text-center">
            <div>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center border-4 border-red-200">
                <LockKeyhole className="h-10 w-10 text-red-600" />
              </div>
</div>
            <CardTitle className="text-3xl font-bold text-red-600 mb-4">
              {t("access_denied_title")}
            </CardTitle>
            <CardDescription className="text-lg mb-4">
              {t("access_denied_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
              <p className="text-center text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-red-600" />
                {t("access_denied_contact")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                {t("return_to_dashboard")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("go_back")}
              </Button>
            </div>
          </CardContent>
        </Card>
</div>
    </div>
  );
};