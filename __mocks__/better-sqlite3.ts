export default class Database {
    prepare() {
        return {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn(),
        };
    }
}
