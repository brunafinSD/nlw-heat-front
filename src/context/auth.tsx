import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = {
  user: User | null;
  signInURL: string;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
  children: ReactNode;
}

export function AuthProvider(props: AuthProvider){
  const [user, setUser] = useState<User | null>(null);

  const signInURL = `https://github.com/login/oauth/authorize?scope=user&client_id=92e65d73cb6b4fa02a3c`

  async function signIn(githubCode: string){
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode,
    });

    const {token, user} = response.data;

    // salvar no localStorage o token
    localStorage.setItem('@doWhile:token', token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  function signOut(){
    setUser(null);
    localStorage.removeItem('@doWhile:token');
  }

  useEffect(() => {
    const token = localStorage.getItem('@doWhile:token');

    if(token){
      // token precisa ir pelo cabeçalho da requisição
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>('profile').then(response => {
        setUser(response.data);
      })
    }

  }, []);

  useEffect(() => {
    // busca a url atual do navegador
    const url = window.location.href;
    // verifica se a url tem o código do github
    const hasGithubCode = url.includes('?code=');

    //se tiver o código do github vamos desestruturar no array
    if(hasGithubCode){
      // urlWithoutCode vai ter tudo antes de ?code=
      // githubCode vai ter tudo depois de ?code=
      const[urlWithoutCode, githubCode] = url.split('?code=')

      // para o usuário não ver o código na url precisamos limpá-la
      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  },[]); 

  return(
    <AuthContext.Provider value={{signInURL, user, signOut}}>
      {props.children}
    </AuthContext.Provider>
  )
}