import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
}

function toOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length > 0 ? text : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const requestedUserId = typeof body.userId === "string" ? body.userId : user.id;
    if (requestedUserId !== user.id) {
      return NextResponse.json({ success: false, error: "不能替其他用户完成引导" }, { status: 403 });
    }

    const interestedCategories = toStringArray(body.interestedCategories ?? body.interested_categories);
    const userRole = toOptionalString(body.userRole ?? body.user_role);
    const userType = toOptionalString(body.userType ?? body.user_type ?? userRole);
    const primaryGoal = toOptionalString(body.primaryGoal ?? body.primary_goal);
    const currentStage = toOptionalString(body.currentStage ?? body.current_stage);
    const cityPreference = toOptionalString(body.cityPreference ?? body.city_preference);
    const targetDirections = toStringArray(body.targetDirections ?? body.target_directions);
    const targetMajors = toStringArray(body.targetMajors ?? body.target_majors);
    const eventPreferences = toStringArray(body.eventPreferences ?? body.event_preferences);
    const activityCities = toStringArray(body.activityCities ?? body.activity_cities);
    const verificationIntent = toOptionalString(body.verificationIntent ?? body.verification_intent);
    const goals = toStringArray(body.goals);
    const now = new Date().toISOString();
    const completionParts = [
      userRole,
      primaryGoal,
      targetDirections.length > 0,
      cityPreference || activityCities.length > 0,
      currentStage,
      verificationIntent,
      interestedCategories.length > 0,
    ];
    const filledParts = completionParts.filter(Boolean).length;
    const profileCompletionScore = Math.max(45, Math.round((filledParts / completionParts.length) * 100));
    const priorityFactors = [
      ...goals,
      ...(primaryGoal ? [primaryGoal] : []),
      ...eventPreferences.map((item) => `event:${item}`),
      ...(verificationIntent ? [`verification:${verificationIntent}`] : []),
    ];

    const supabase = createServiceClient();
    const upsertData: Record<string, unknown> = {
      id: user.id,
      interested_categories: interestedCategories,
      target_directions: targetDirections,
      target_majors: targetMajors,
      priority_factors: priorityFactors,
      has_completed_onboarding: true,
      profile_completion_score: profileCompletionScore,
      onboarding_completed_at: now,
      updated_at: now,
    };
    if (userRole) upsertData.user_role = userRole;
    if (userType) upsertData.user_type = userType;
    if (cityPreference) {
      upsertData.city_preference = cityPreference;
      upsertData.location = cityPreference;
    } else if (activityCities[0]) {
      upsertData.location = activityCities[0];
    }
    if (currentStage) {
      upsertData.portfolio_status = currentStage;
      if (userRole === "student") upsertData.current_education_stage = currentStage;
    }
    if (targetMajors.length > 0) {
      upsertData.favorite_artists_or_styles = targetMajors.join("、");
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert(upsertData, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg || "服务器错误" }, { status: 500 });
  }
}
