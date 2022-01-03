import jsonp from "jsonp";
import queryString from "query-string";
import { ChangeEvent, useState } from "react";

interface Params {
  [key: string]: unknown;
}

export const useFormFields: (initialState: Params) => {
  handleFieldChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fields: Params;
} = (initialState: Params) => {
  const [fields, setValues] = useState(initialState);
  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...fields,
      [event.target.id]: event.target.value,
    });
  };
  const setField = (fieldName: string, value: any) => setValues({
    ...fields,
    [fieldName]: value
  })
  return { fields, handleFieldChange, setField };
};

export const useMailChimpForm: (url: string) => {
  handleSubmit: (params: Params) => void;
  success: boolean;
  reset: () => void;
  loading: boolean;
  error: boolean;
  message: string;
} = (url: string) => {
  const initStatusState = {
    loading: false,
    error: false,
    success: false,
  };
  const [status, setStatus] = useState(initStatusState);
  const [message, setMessage] = useState("");

  const handleSubmit = (params: Params): void => {
    const query = queryString.stringify(params);
    const endpoint = url.replace("/post?", "/post-json?") + "&" + query;
    setStatus({ ...status, loading: true });
    setMessage("");
    jsonp(endpoint, { param: "c" }, (error, data) => {
      if (error) {
        setStatus({ ...initStatusState, error: true });
        setMessage(error.message);
      } else {
        if (data.result !== "success") {
          setStatus({ ...initStatusState, error: true });
        } else {
          setStatus({ ...initStatusState, success: true });
        }
        setMessage(data.msg);
      }
    });
  };

  const reset: () => void = () => {
    setMessage("");
    setStatus(initStatusState);
  };

  return {
    loading: status.loading,
    success: status.success,
    error: status.error,
    message,
    handleSubmit,
    reset,
  };
};
