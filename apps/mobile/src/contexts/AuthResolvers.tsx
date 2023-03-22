import React, {useContext, useMemo, useRef} from 'react';

type Resolver = () => void;

interface AuthResolversContext {
  enqueueAuthResolver: (resolver: Resolver) => void;
  hasAuthResolvers: () => boolean;
  invokeAuthResolvers: () => void;
  flushAuthResolvers: () => void;
}

const AuthResolversContext = React.createContext<AuthResolversContext>(
  {} as AuthResolversContext,
);

export const AuthResolversProvider: React.FC = ({children}) => {
  const resolversRef = useRef<Resolver[]>([]);

  const context = useMemo<AuthResolversContext>(
    () => ({
      enqueueAuthResolver: resolver => {
        if (resolversRef.current?.length) {
          resolversRef.current = [...resolversRef.current, resolver];
        }
        resolversRef.current = [resolver];
      },
      invokeAuthResolvers: () => {
        resolversRef.current?.forEach(resolver => {
          resolver();
        });
        resolversRef.current = [];
      },
      flushAuthResolvers: () => {
        resolversRef.current = [];
      },
      hasAuthResolvers: () => !!resolversRef.current?.length,
    }),
    [],
  );

  return (
    <AuthResolversContext.Provider value={context}>
      {children}
    </AuthResolversContext.Provider>
  );
};

export const useAuthResolvers = () => {
  return useContext(AuthResolversContext);
};
