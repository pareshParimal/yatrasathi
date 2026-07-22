import org.springframework.web.reactive.function.client.WebClient;

public class TestWebClient {
    public static void main(String[] args) {
        WebClient.Builder builder = WebClient.builder();
        WebClient w1 = builder.baseUrl("http://first.com").build();
        WebClient w2 = builder.baseUrl("http://second.com").build();
        
        System.out.println("w1 base? no easy way to print");
    }
}
