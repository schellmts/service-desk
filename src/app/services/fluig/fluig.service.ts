// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import {environment} from '../../environment/environment';
// import OAuth from 'oauth-1.0a';
// import * as CryptoJS from 'crypto-js';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class FluigService {
//   constructor(private http: HttpClient) {}
//
//   private getOAuthHeaders(method: string, url: string): HttpHeaders {
//     const oauth = new OAuth({
//       consumer: {
//         key: environment.oauth.consumerKey,
//         secret: environment.oauth.consumerSecret,
//       },
//       signature_method: 'HMAC-SHA1',
//       hash_function(base_string, key) {
//         return CryptoJS.HmacSHA1(base_string, key).toString(
//           CryptoJS.enc.Base64
//         );
//       },
//     });
//
//     const token = {
//       key: environment.oauth.accessToken,
//       secret: environment.oauth.tokenSecret,
//     };
//
//     const authHeader = oauth.toHeader(oauth.authorize({ url, method }, token));
//
//     return new HttpHeaders({
//       Authorization: authHeader['Authorization'],
//       'Content-Type': 'application/json',
//     });
//   }
//   /**
//    * Lista todos os cards de um formulário (sem filhos).
//    */
//
//   public listCards(formId: number): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/ecm-forms/api/v2/cardindex/${formId}/cards`;
//     const headers = this.getOAuthHeaders('GET', url);
//     return this.http
//       .get<any>(url, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - listCards] Resposta para formId ${formId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//   /**
//    * Busca um card específico, incluindo dados Pai x Filho.
//    */
//
//   public getCardWithChildren(formId: number, cardId: number): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/ecm-forms/api/v2/cardindex/${formId}/cards/${cardId}?expand=children`;
//     const headers = this.getOAuthHeaders('GET', url);
//     return this.http
//       .get<any>(url, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - getCardWithChildren] Resposta para cardId ${cardId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//   /**
//    * Busca dados de um dataset do Fluig.
//    */
//
//   /* public getDataset(datasetId: string): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/dataset/search?datasetId=${datasetId}`;
//     const headers = this.getOAuthHeaders('GET', url);
//     return this.http
//       .get<any>(url, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - getDataset] Resposta para dataset ${datasetId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   } */
//
//   public getDataset(datasetId: string, constraints: any[] = [], order: string[] = []): Observable<any> {
//
//     // CENÁRIO 1: Busca Simples (Sem filtros) -> Usa GET (Search)
//     // Isso conserta o PacienteService e o LoginService que buscam tudo.
//     if ((!constraints || constraints.length === 0) && (!order || order.length === 0)) {
//       const url = `${environment.fluigBaseUrl}/api/public/ecm/dataset/search?datasetId=${datasetId}`;
//       const headers = this.getOAuthHeaders('GET', url);
//
//       return this.http.get<any>(url, { headers }).pipe(
//         tap((dadosBrutos) => {
//           // Log opcional
//           // console.log(`[LOG - getDataset GET] ${datasetId}`, dadosBrutos?.content?.length);
//         })
//       );
//     }
//
//     // CENÁRIO 2: Busca Filtrada -> Usa POST
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/dataset/datasets`;
//     const headers = this.getOAuthHeaders('POST', url);
//
//     const payload = {
//       name: datasetId,
//       constraints: constraints,
//       order: order
//     };
//
//     return this.http.post<any>(url, payload, { headers }).pipe(
//       tap((dadosBrutos) => {
//         console.log(`[LOG - getDataset POST] ${datasetId} com filtros.`);
//       })
//     );
//   }
//   /**
//    * Cria um novo registro em um formulário do Fluig.
//    */
//
//   public createCard(formId: number, payload: any): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/ecm-forms/api/v2/cardindex/${formId}/cards`;
//     const headers = this.getOAuthHeaders('POST', url);
//     return this.http
//       .post<any>(url, payload, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - createCard] Resposta para formId ${formId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//   /**
//    * Atualiza os dados de uma ficha existente no Fluig.
//    */
//
//   public updateCard(
//     formId: number,
//     cardId: number,
//     payload: any
//   ): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/ecm-forms/api/v2/cardindex/${formId}/cards/${cardId}`;
//     const headers = this.getOAuthHeaders('PUT', url);
//     return this.http
//       .put<any>(url, payload, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - updateCard] Resposta para cardId ${cardId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//
//   /**
//    * Executa um dataset do Fluig via POST, enviando um payload.
//    * Ideal para datasets que usam createDataset para integração (como escrita no RM).
//    */
//   public executeDataset(datasetId: string, payload: any): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/dataset/datasets`;
//     const headers = this.getOAuthHeaders('POST', url);
//
//     // O dataset do Fluig espera que o 'fields[0]' seja uma string JSON.
//     const fluigPayload = {
//       name: datasetId,
//       fields: [
//         JSON.stringify(payload), // Transforma o objeto Angular em uma string JSON
//       ],
//       // constraints: [], // Não parece ser usado pelo seu dataset
//       // order: []
//     };
//
//     return this.http
//       .post<any>(url, fluigPayload, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - executeDataset] Resposta para dataset ${datasetId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//
//   /**
//    * Executa dataset usando a API V2 (Internal Handle).
//    * Mesma lógica que funciona no Postman.
//    */
//   public getDatasetV2(datasetId: string, constraints: { field: string, value: string }[]): Observable<any> {
//     // Note a URL diferente: dataset/api/v2/dataset-handle/search
//     let url = `${environment.fluigBaseUrl}/dataset/api/v2/dataset-handle/search?datasetId=${datasetId}`;
//
//     // Adiciona as constraints repetindo o nome do parâmetro (padrão V2)
//     constraints.forEach(c => {
//       const val = encodeURIComponent(c.value);
//       // Na V2, passamos constraintsField e constraintsInitialValue repetidos
//       url += `&constraintsField=${c.field}&constraintsInitialValue=${val}`;
//     });
//
//     // A V2 geralmente aceita o mesmo OAuth Header da V1
//     const headers = this.getOAuthHeaders('GET', url);
//
//     console.log(`[FluigAPI] getDatasetV2 URL: ${url}`);
//
//     return this.http.get<any>(url, { headers });
//   }
//
//   /**
//    * Exclui uma ficha de formulário no Fluig.
//    */
//   public deleteCard(formId: number, cardId: number): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/ecm-forms/api/v2/cardindex/${formId}/cards/${cardId}`;
//     const headers = this.getOAuthHeaders('DELETE', url);
//     return this.http
//       .delete<any>(url, { headers })
//       .pipe(
//         tap((dadosBrutos) =>
//           console.log(
//             `[LOG - deleteCard] Resposta para cardId ${cardId}:`,
//             dadosBrutos
//           )
//         )
//       );
//   }
//
//   /**
//    * PASSO 1: Envia o arquivo para a área de upload temporária do usuário logado.
//    * API: POST /api/public/2.0/documents/upload/{fileName}
//    */
//   public uploadAreaTemporaria(arquivo: File): Observable<any> {
//     const fileName = arquivo.name;
//     const encodedFileName = encodeURIComponent(fileName);
//     const url = `${environment.fluigBaseUrl}/api/public/2.0/documents/upload/${encodedFileName}`;
//
//     // OAuth Headers
//     let headers = this.getOAuthHeaders('POST', url);
//     // Remove Content-Type para o navegador definir o boundary do FormData
//     headers = headers.delete('Content-Type');
//
//     const formData = new FormData();
//     formData.append('file', arquivo);
//
//     console.log(`[FluigAPI] Passo 1: Enviando ${fileName} para área temporária...`);
//
//     return this.http.post<any>(url, formData, { headers }).pipe(
//       tap((res) => console.log(`[FluigAPI] Passo 1 OK:`, res))
//     );
//   }
//
//   /**
//    * PASSO 2: Cria o documento pegando o arquivo da área temporária.
//    * API: POST /api/public/ecm/document/createDocument
//    */
//   public criarDocumentoDoTemporario(parentId: number, fileName: string): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/document/createDocument`;
//     const headers = this.getOAuthHeaders('POST', url);
//     const idPasta = parseInt(String(parentId), 10);
//
//     // Remove extensão para a descrição
//     const partes = fileName.split('.');
//     const extensao = partes.length > 1 ? partes.pop() : '';
//     const descricao = partes.join('.');
//
//     const payload = {
//       description: descricao,
//       parentId: idPasta,
//       downloadEnabled: true,
//       attachments: [
//         {
//           fileName: fileName, // O Fluig vai procurar esse nome na área temporária
//           principal: true,
//           attach: false // Importante!
//           // Note que NÃO enviamos 'fileContent' aqui.
//         }
//       ],
//       inheritSecurity: true,
//     };
//
//     console.log(`[FluigAPI] Passo 2: Criando documento na pasta ${idPasta} a partir do arquivo temporário...`);
//
//     return this.http.post<any>(url, payload, { headers }).pipe(
//       tap((res) => console.log(`[FluigAPI] Passo 2 OK:`, res))
//     );
//   }
//
//   public publicarDocumentoBase64(parentId: number, nomeOriginal: string, base64Content: string): Observable<any> {
//     // Rota V1: Essa é a clássica que sempre funciona
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/document/createDocument`;
//     const headers = this.getOAuthHeaders('POST', url);
//     const idPasta = parseInt(String(parentId), 10);
//
//     // --- SANITIZAÇÃO DE NOME (O SEGREDO) ---
//     // Fluig odeia espaços e acentos no 'fileName' técnico.
//     // Vamos criar um nome técnico limpo, mas manter o nome real na descrição.
//     const timestamp = new Date().getTime();
//
//     // Detecta extensão ou força .png
//     let extensao = 'png';
//     if (nomeOriginal.toLowerCase().includes('.')) {
//       extensao = nomeOriginal.split('.').pop() || 'png';
//     }
//     const nomeTecnico = `upload_${timestamp}.${extensao}`;
//
//     const payload = {
//       description: nomeOriginal, // O Usuário vê: "Foto do Perfil.png"
//       parentId: idPasta,
//       downloadEnabled: true,
//       attachments: [
//         {
//           fileName: nomeTecnico, // O Sistema vê: "upload_1741234.png" (Sem erros!)
//           principal: true,
//           attach: false,
//           fileContent: base64Content
//         }
//       ],
//       inheritSecurity: true,
//     };
//
//     console.log(`[FluigAPI] Upload V1 Sanitizado: ${nomeTecnico} na pasta ${idPasta}`);
//
//     return this.http.post<any>(url, payload, { headers }).pipe(
//       tap((res) => console.log(`[FluigAPI] Sucesso:`, res))
//     );
//   }
//
//   public publicarArquivoV2(parentId: number, arquivo: File): Observable<any> {
//     // 1. Garante que o nome tenha extensão (vital para o Fluig não rejeitar)
//     let fileName = arquivo.name;
//     if (!fileName.toLowerCase().includes('.')) {
//       fileName += '.png'; // Fallback padrão
//     }
//
//     // 2. Codifica o nome para URL (evita erro com espaços e acentos)
//     const encodedFileName = encodeURIComponent(fileName);
//
//     // 3. Monta a URL exata da V2
//     const url = `${environment.fluigBaseUrl}/api/public/2.0/documents/upload/${encodedFileName}/${parentId}/publish`;
//
//     // 4. Headers OAuth SEM Content-Type (o browser define multipart/form-data sozinho)
//     let headers = this.getOAuthHeaders('POST', url);
//     headers = headers.delete('Content-Type');
//
//     // 5. O FormData é o "envelope" físico do arquivo
//     const formData = new FormData();
//     formData.append('file', arquivo);
//
//     console.log('%c--- UPLOAD V2 DIRETO ---', 'color: green; font-weight: bold;');
//     console.log('Pasta Destino:', parentId);
//     console.log('Arquivo:', fileName);
//     console.log('URL:', url);
//
//     return this.http.post<any>(url, formData, { headers }).pipe(
//       tap((res) => console.log(`[LOG - Upload V2] Resposta:`, res))
//     );
//   }
//
//   /**
//    * Busca dados de um dataset aplicando filtros (Constraints) no servidor.
//    * Isso evita trazer todos os registros e previne erro 500.
//    */
//   public getDatasetWithConstraints(datasetId: string, constraints: any[]): Observable<any> {
//     const url = `${environment.fluigBaseUrl}/api/public/ecm/dataset/datasets`;
//     const headers = this.getOAuthHeaders('POST', url);
//
//     const payload = {
//       name: datasetId,
//       constraints: constraints
//     };
//
//     return this.http
//       .post<any>(url, payload, { headers })
//       .pipe(
//         tap((dados) =>
//           // Comente este log em produção se vierem muitos dados
//           console.log(`[LOG - getDatasetWithConstraints] ${datasetId}:`, dados?.content?.length || 0, 'registros')
//         )
//       );
//   }
// }
