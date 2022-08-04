export type AppEntityName = "IntroductionText" | "Skill";

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