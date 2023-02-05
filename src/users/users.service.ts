import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types';
import { UserRegisterDto } from "./dto/user-register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";

@injectable()
export class UserService implements IUserService {
    
    constructor(@inject(TYPES.ConfigService) private configService: IConfigService) {}

    async createUser({ email, name, password }: UserRegisterDto): Promise<User | null> {
        const newUser = new User(email, name);
        const salt = this.configService.get('SALT')
        console.log(salt)
        await newUser.setPassword(password, +salt);
        // проверка 
        // если есть - ретурн null
        // если нет - создаем 
        return null;
    }

    async validateUser(dto: UserRegisterDto): Promise<boolean> {
        return true;
    }
}
