interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (element: HTMLElement, options: { theme?: string; size?: string; text?: string; width?: number | string }) => void;
        cancel: () => void;
        prompt?: () => void;
      };
    };
  };
}