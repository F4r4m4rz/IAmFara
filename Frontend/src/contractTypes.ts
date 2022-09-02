export type AppEntityName = "IntroductionText" | "Skill";

export type ApiResponse<T> = {
    data: T | null,
    alerts: AlertDto[]
}

export type IntroductionTextDto = {
    id: number;
    createdOn: string;
    text: string;
    lastUpdatedOn: string;
}

export enum SkillRateDto {
    beginner = 1,
    someExperience = 2,
    businessExperience = 3,
    expert = 4,
    master = 5
}

export type SkillDto = {
    id: number,
    title: string,
    description: string,
    rate: SkillRateDto 
}

export type SignUpDto = {
    email: string,
    firstName: string,
    lastName: string,
    password: string
}

export type SignInDto = {
    email: string,
    password: string
}

export type SecurityUser = {
    email: string,
    firstName: string,
    lastName: string,
    userRoles: UserRole[]
}

export type UserRole = {
    role: string,
}

export enum AlertLevelDto
{
    Info,
    Success,
    Warning,
    Error
}

export type AlertDto = {
    id: string,
    level: AlertLevelDto,
    message: string,
    dismissable: boolean,
    autoDismiss: boolean,
    timeout: number
}