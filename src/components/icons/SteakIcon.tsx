interface IconProps {
    className?: string;
}

export const SteakIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <img 
                src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765305598611-file.png"
                alt="סטייק סינטה"
                className="w-full h-full object-contain"
            />
        </div>
    );
};