// src/components/common/BrandLogo.tsx

export const BrandLogo = () => {
  return (
    <div className="flex items-center hover:opacity-90 transition-opacity">
      <img 
        src="/logo1.png" 
        alt="Logo Casa con SI" 
        /* Usamos h-14 en móviles y h-16 en escritorio para que encaje perfecto en el Header */
        className="h-14 md:h-2.5rem w-auto object-contain"
      />
      <span className="text-xl md:text-2l font-bold text-base-white hidden sm:inline">
        CASA CON SI
      </span>
    </div>
  );
};
