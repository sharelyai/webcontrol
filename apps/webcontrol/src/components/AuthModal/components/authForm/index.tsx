import { useEffect, useState } from "react";
import {
  Google,
  Loader,
  useCountdown,
} from "@sharelyai/ui-shared";
import {
  constants,
  cookieManager,
  customEvents,
  regex,
  schemas,
  supabaseClient,
  useGlobalStore,
  useSharelyContext
} from "@sharelyai/services";
import { Wrapper } from "./styles";

export interface IAuthFormProps {
  onClose: () => void;
  handleInitWithToken: (token: string) => void;
}

export type TStatus = "idle" | "pending" | "resolved" | "rejected" | "internal_rejected";
enum TSteps { GET_EMAIL, GET_OTP }
enum TAuthType { EMAIL, GOOGLE }
enum TAuthView { SIGN_IN, SIGN_UP }

export const AuthForm = ({ onClose, handleInitWithToken }: IAuthFormProps) => {
  const [status, setStatus] = useState<TStatus>("idle");
  const [view, setView] = useState(TAuthView.SIGN_IN);
  const [step, setStep] = useState<TSteps>(TSteps.GET_EMAIL);
  const [values, setValues] = useState({ email: "", otp: "" });
  const [error, setError] = useState<any>({ email: undefined, otp: undefined });
  const [shouldStartCountdown, setShouldStartCountdown] = useState(false);
  
  const secondsCountdown = useCountdown({
    initialSeconds: 60,
    startCountdown: shouldStartCountdown,
    onComplete: () => setShouldStartCountdown(false),
  });

  const { config, userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabledEmail = values.email.length > 0;
  const isEnableOtp = isEnabledEmail && values.otp.length > 0;
  const isDisabledNextButton = step === TSteps.GET_EMAIL ? !isEnabledEmail : !isEnableOtp;
  const isSignIn = view === TAuthView.SIGN_IN;
  const isSignUp = view === TAuthView.SIGN_UP;
  const errors = error && Object.values(error)?.filter((value) => value);
  
  const temporalToken = cookieManager.get(
    cookieManager.getCookieName([constants.COOKIES_KEYS.TEMPORAL, config?.workspaceId])
  );

  useEffect(() => {
    const handleViewChange = (e: Event) => {
      const { view } = (e as CustomEvent<{ view: number }>).detail;
      setView(view);
    };
    customEvents.subscribe(constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION_VIEW, handleViewChange);
    return () => customEvents.unsubscribe(constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION_VIEW, handleViewChange);
  }, []);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (e.target.name === "email") {
      const isCorrectEmail = regex.EMAIL.test(e.target.value);
      setError((prev: any) => ({
        ...prev,
        email: !isCorrectEmail ? "Please enter a valid email address" : undefined,
      }));
    }
  };

  const handleAuthWithGoogle = async () => {
    try {
      setStatus("pending");
      const { data } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: (import.meta.env.VITE_REDIRECT_URL || '') + "?" + 
            new URLSearchParams({
              origin: window?.location?.origin,
              [constants.LOCAL_STORAGE_KEYS.PUBLIC_SPACE_TOKEN]: temporalToken || '',
            }).toString(),
          scopes: "openid profile email",
          skipBrowserRedirect: true,
        },
      });

      if (data?.url) {
        const popup = window.open(data.url, "_blank", "width=600,height=600");
        if (!popup) return;

        const interval = setInterval(async () => {
          const myAccessToken = cookieManager.get(
            cookieManager.getCookieName([constants.COOKIES_KEYS.MY_ACCESS, config?.workspaceId])
          );

          if (myAccessToken) {
            popup?.close();
            clearInterval(interval);
            
            // Logic for activating user and public space
            // Simplified for brevity, usually calls apiClient
            
            handleInitWithToken(myAccessToken);
            setStatus("resolved");
            onClose();
          }
        }, 500);
      }
    } catch (error) { console.error(error); }
  };

  const handleAuthEmailLogin = async () => {
    setStatus("pending");
    try {
      // Validate schema
      await schemas.SIGN_IN_SCHEMA.validate(values, { abortEarly: false });
      
      const registrationBy = constants.REGISTRATION_BY_OTP;
      
      await apiClient.fetcher(`/user/metadata`, {
        method: "PUT",
        body: JSON.stringify({ email: values.email, registrationBy }),
      });

      const { error } = await supabaseClient.auth.signInWithOtp({
        email: values.email,
        options: { shouldCreateUser: true, data: { registrationBy } },
      });

      if (error) {
        setStatus("internal_rejected");
        return;
      }

      setStatus("resolved");
      setStep(TSteps.GET_OTP);
      setShouldStartCountdown(true);
    } catch (error: any) {
      setStatus("rejected");
      if (error.name === "ValidationError") {
        setError({ email: "Email not valid" });
      }
    }
  };

  if (status === "pending") {
    return (
      <Wrapper>
        <div className="modal-container-loading">
          <Loader type="card-loading" text="Loading..." />
        </div>
      </Wrapper>
    );
  }

  if (step === TSteps.GET_OTP) {
    return (
      <Wrapper>
        <span className="title">
          <p>Enter the 6 digit code we have sent to {values.email}</p>
        </span>
        <div className="body">
          <div className="form">
            <input type="text" name="otp" placeholder="Enter code" value={values.otp} onChange={handleChangeInput} />
            {errors?.map((value: any) => <span className="error" key={value}>{value}</span>)}
            <button onClick={handleAuthEmailLogin} disabled={isDisabledNextButton}>Continue</button>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <span className="title">
        {isSignIn ? <p>Welcome back</p> : <p>Create an account to save your conversation</p>}
      </span>
      <div className="body">
        <div className="form">
          <input type="email" name="email" placeholder="Enter your email" value={values.email} onChange={handleChangeInput} />
          {errors?.map((value: any) => <span className="error" key={value}>{value}</span>)}
          <button onClick={() => setStep(TSteps.GET_OTP)} disabled={isDisabledNextButton}>
            {isSignIn ? "Login" : "Create account"}
          </button>
        </div>
        <div className="divider"><span className="line" /><span>or</span><span className="line" /></div>
        <div className="others-methods">
          <button onClick={handleAuthWithGoogle}><Google />Continue with Google</button>
        </div>
      </div>
    </Wrapper>
  );
};