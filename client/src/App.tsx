import LandingPage from '@/pages/components/LandingPage'
import { useSelector, useDispatch } from "react-redux";
import type {RootState, AppDispatch} from "@/store"
import { completeOnboarding } from "./store/onboardingSlice";
import Onboarding from '@/pages/components/Onboarding'
import Dashboard from "@/pages/components/Dashboard";
export default function App () {
  const dispatch = useDispatch<AppDispatch>()
  const completed = useSelector((s: RootState) => s.onboarding.completed) 
  const handleOnboardingComplete = ()=> {
    dispatch(completeOnboarding())
  }

  if (!completed) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }
  if (completed)
  {return <Dashboard />}
  
  return <LandingPage />;
  
};


