import { injectable } from "inversify";
import { UserRegisterDto } from "./dto/user-register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";

@injectable()
export class UserService implements IUserService {

    async createUser({ email, name, password }: UserRegisterDto): Promise<User | null> {
        const newUser = new User(email, name);
        await newUser.setPassword(password);
        // проверка 
        // если есть - ретурн null
        // если нет - создаем 
        return null;
    }

    async validateUser(dto: UserRegisterDto): Promise<boolean> {
        return true;
    }
}
