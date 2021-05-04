interface ProfileStatus {
	banned: boolean;
	probation: boolean;
	verified: boolean;
}

interface Trophies {
	gold: number;
	silver: number;
	bronze: number;
}

interface Experience {
	category: string;
	format: string;
	season: string;
	div: string;
	team: string;
	endRank: string;
	recordWith: Date;
	recordWithout: Date | null;
	amountWon: number;
	joined: Date;
	left: Date | null;
	isCurrentTeam: boolean;
}

interface SuccessDataObject {
	steamId: string;
	avatar: string;
	name: string;
	link: string;
	status: ProfileStatus;
	totalEarnings: number;
	trophies: Trophies;
	experience: Experience[];
}

export interface RglApiError {
	statusCode: 404;
	steamId: string;
	message: string;
}

export interface RglApiResponse {
	data: SuccessDataObject;
	time?: number;
}