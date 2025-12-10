interface IconProps {
    className?: string;
}

export const ShakerIcon = ({ className }: IconProps) => {
    return (
        <img 
            src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765364430942-file.png"
            alt="שייקר גיינר"
            className={`${className} object-contain`}
        />
    );
};