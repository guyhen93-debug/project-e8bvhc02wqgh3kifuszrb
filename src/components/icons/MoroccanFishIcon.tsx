interface IconProps {
    className?: string;
}

export const MoroccanFishIcon = ({ className = "" }: IconProps) => {
    return (
        <img 
            src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765362226946-Gemini-Generated-Image-homjt9homjt9homj-2.png"
            alt="דג מרוקאי (טאג'ין)"
            className={className || "w-8 h-8"}
            style={{ minWidth: '28px', minHeight: '28px' }}
        />
    );
};