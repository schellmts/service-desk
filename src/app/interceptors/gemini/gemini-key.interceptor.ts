import { HttpHandler, HttpInterceptor, HttpRequest, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../environment/environment";
import { GeminiApiKeyService } from "../../services/gemini-api-key.service";

@Injectable()
export class GeminiKeyInterceptor implements HttpInterceptor {
  private apiKeyService = inject(GeminiApiKeyService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!req.url.includes(environment.APP_GEMINI_URL)) {
      return next.handle(req);
    }

    // Usar chave do serviço (inserida pelo usuário) ou fallback para environment
    const apiKey = this.apiKeyService.getApiKey() || environment.APP_GEMINI_KEY;

    // Se não houver chave, passar a requisição sem chave (vai dar erro, mas não quebra)
    if (!apiKey) {
      return next.handle(req);
    }

    let params = req.params || new HttpParams();
    if (!params.has('key')) {
      params = params.set('key', apiKey);
    }

    const authReq = req.clone({
      params: params
    });

    return next.handle(authReq);
  }
}
