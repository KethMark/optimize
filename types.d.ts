interface Auth {
  auth: Session | null
}

interface AuthCredentials {
  name: string
  email: string
  password: string
  message: string
}

interface documentsList {
  id: string;
  users: string;
  fileUrl: string;
  fileName: string;
  createdAt: Date | null;
}

interface FileStorageSearch {
  fileStorage: documentsList[];
  newOffset: number | null;
  totalFileStorage: number;
}

interface documents {
  document: Documents;
}

interface DeletePDF  {
  id: string;
  fileName: string;
  text: string;
};

interface profileUser  {
  name: string;
  email: string;
  image: string
};

interface ChatId {
  chatId?: string
}

interface UploadPDFParams  {
  id: string;
  fileUrl: string;
  fileName: string;
  Message: string;
};