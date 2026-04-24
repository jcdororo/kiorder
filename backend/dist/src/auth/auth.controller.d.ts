import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: AuthDto): Promise<{
        message: string;
        userId: string;
    }>;
    login(dto: AuthDto, res: Response): Promise<{
        role: string;
    }>;
    logout(res: Response): {
        message: string;
    };
}
