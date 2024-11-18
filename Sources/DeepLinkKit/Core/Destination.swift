
public enum Destination: Equatable {
    case product(id: String)
    case article(id: String)
    case campaign(id: String)
    case category(id: String)
    case home
}
